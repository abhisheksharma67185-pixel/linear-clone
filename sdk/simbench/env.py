"""Gymnasium-compatible environment for SimBench."""

from __future__ import annotations
from typing import Any, Optional, Literal

import gymnasium as gym
from simbench.client import SimBenchClient


class SimBenchEnv(gym.Env):
    """Gymnasium env wrapping a SimBench site.

    Usage:
        env = SimBenchEnv(base_url="http://localhost:3000", task_id="prod-001")
        obs, info = env.reset()
        obs, reward, terminated, truncated, info = env.step({"action": "update_product", ...})
        result = env.finish()
    """

    metadata = {"render_modes": ["human"]}

    def __init__(
        self,
        base_url: str = "http://localhost:3000",
        task_id: str = "prod-001",
        mode: Literal["rest", "browser"] = "rest",
        render_mode: Optional[str] = None,
        seed: Optional[int] = None,
        config_overrides: Optional[dict[str, Any]] = None,
        # Browser mode options
        headless: bool = True,
        viewport: tuple[int, int] = (1280, 720),
    ):
        super().__init__()
        self.base_url = base_url
        self.task_id = task_id
        self.mode = mode
        self.render_mode = render_mode
        self._seed = seed
        self._config_overrides = config_overrides
        self._headless = headless
        self._viewport = viewport

        self._client = SimBenchClient(base_url)
        self._browser = None
        self._page = None
        self._episode = None
        self._step_count = 0

        # Gymnasium spaces — dict-based for flexibility
        self.action_space = gym.spaces.Dict({})
        self.observation_space = gym.spaces.Dict({})

    def reset(
        self,
        *,
        seed: Optional[int] = None,
        options: Optional[dict[str, Any]] = None,
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        """Start a new episode for the configured task."""
        effective_seed = seed if seed is not None else self._seed
        overrides = self._config_overrides
        if options and "config_overrides" in options:
            overrides = options["config_overrides"]

        ep = self._client.start_episode(
            task_id=self.task_id,
            mode=self.mode,
            seed=effective_seed,
            config_overrides=overrides,
        )
        self._episode = ep
        self._step_count = 0

        if self.mode == "browser":
            self._close_browser()
            self._init_browser()
            self._page.goto(f"{self.base_url}/admin")

        obs = self._get_observation()
        info = {
            "episode_id": ep.episode_id,
            "task_id": ep.task["id"],
            "task_goal": ep.task["goal"],
            "max_steps": ep.task["max_steps"],
        }
        return obs, info

    def step(
        self, action: dict[str, Any]
    ) -> tuple[dict[str, Any], float, bool, bool, dict[str, Any]]:
        """Execute an action and return Gymnasium 5-tuple."""
        self._step_count += 1

        if self.mode == "rest":
            resp = self._client.step(action)
            return (
                resp.observation,
                resp.reward,
                resp.done,
                resp.truncated,
                resp.info,
            )
        else:
            # Browser mode: execute Playwright action
            reward = self._execute_browser_action(action)
            obs = self._get_observation()
            ep_info = self._client.get_episode()
            terminated = ep_info.get("status") in ("completed", "failed")
            truncated = ep_info.get("status") == "timeout"
            return obs, reward, terminated, truncated, ep_info

    def evaluate(self) -> dict[str, Any]:
        """Mid-episode evaluation (non-destructive)."""
        result = self._client.evaluate()
        return result.model_dump()

    def finish(self, agent_response: Optional[str] = None) -> dict[str, Any]:
        """End the episode and get final score."""
        result = self._client.finish_episode(agent_response)
        return result.model_dump()

    def _close_browser(self) -> None:
        """Close the browser and Playwright instance if they exist."""
        if self._browser:
            self._browser.close()
            self._browser = None
        if hasattr(self, '_pw') and self._pw:
            self._pw.stop()
            self._pw = None

    def close(self) -> None:
        self._close_browser()
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
        return False

    # -- Browser mode helpers --

    def _init_browser(self) -> None:
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            raise ImportError(
                "Browser mode requires playwright. Install with: "
                "pip install 'simbench[browser]'"
            )
        self._pw = sync_playwright().start()
        self._browser = self._pw.chromium.launch(headless=self._headless)
        self._page = self._browser.new_page(
            viewport={"width": self._viewport[0], "height": self._viewport[1]}
        )

    def _execute_browser_action(self, action: dict[str, Any]) -> float:
        """Translate action dict to Playwright calls."""
        action_type = action.get("type", "")

        if action_type == "click":
            self._page.click(action["selector"])
        elif action_type == "fill":
            self._page.fill(action["selector"], action["value"])
        elif action_type == "navigate":
            self._page.goto(f"{self.base_url}{action['url']}")
        elif action_type == "select":
            self._page.select_option(action["selector"], action["value"])
        elif action_type == "keyboard":
            self._page.keyboard.press(action["key"])
        elif action_type == "scroll":
            self._page.mouse.wheel(0, action.get("delta", 300))

        # Log to server for step tracking
        self._client.log_action(
            action=action_type,
            payload=action,
            reward=-0.01,
            success=True,
        )
        return -0.01  # Step penalty; real reward at finish

    def _get_observation(self) -> dict[str, Any]:
        if self.mode == "rest":
            data = self._client.observe()
            return data.get("observation", data)
        else:
            # Browser mode: screenshot + accessibility tree + state
            screenshot = self._page.screenshot()
            a11y_tree = self._page.accessibility.snapshot()
            state = self._client.get_state()
            return {
                "screenshot": screenshot,
                "accessibility_tree": a11y_tree,
                "url": self._page.url,
                "state": state,
            }


def make(
    site: str = "shopify-admin",
    task_id: str = "prod-001",
    base_url: str = "http://localhost:3000",
    mode: Literal["rest", "browser"] = "rest",
    **kwargs: Any,
) -> SimBenchEnv:
    """Factory function for creating SimBench environments.

    Usage:
        env = simbench.make("shopify-admin", task_id="prod-001")
        env = simbench.make("shopify-admin", task_id="ord-001", mode="browser")
    """
    # Use site to construct the base_url if a non-default site is provided
    effective_url = base_url
    if site != "shopify-admin" and base_url == "http://localhost:3000":
        effective_url = f"http://localhost:3000/sites/{site}"

    return SimBenchEnv(
        base_url=effective_url,
        task_id=task_id,
        mode=mode,
        **kwargs,
    )

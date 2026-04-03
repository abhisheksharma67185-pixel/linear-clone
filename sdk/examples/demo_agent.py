"""
Rule-based demo agent for SimBench.

This agent parses task goals and takes correct actions using observation data
to resolve entity names to internal IDs. It does NOT use an LLM — it's pure
string matching + heuristics. Useful as a baseline and demo.

Exports:
    agent_step(obs, info) -> action dict
    agent_response(obs, info) -> str or None
    MODEL = "rule-based-v1"
"""

from __future__ import annotations
import re
from typing import Any, Optional

MODEL = "rule-based-v1"

# ─── State persisted across steps within one episode ─────────────────
_goal: str = ""
_task_id: str = ""
_task_type: str = ""
_step: int = 0
_acted: bool = False  # True once primary action is taken


def agent_step(obs: dict[str, Any], info: dict[str, Any]) -> dict[str, Any]:
    """Pick an action based on the current observation and task goal."""
    global _goal, _task_id, _task_type, _step, _acted

    # On first step, capture task info from episode
    ep = obs.get("observation", obs).get("episode") or {}
    if ep.get("taskGoal"):
        _goal = ep["taskGoal"]
        _task_id = ep.get("taskId", "")
        _task_type = info.get("task_type", "")

    # Also try info from reset
    if not _goal and info.get("task_goal"):
        _goal = info["task_goal"]
        _task_id = info.get("task_id", "")

    _step += 1
    inner = obs.get("observation", obs)
    data = inner.get("data", {})
    goal = _goal.lower()

    # If we already performed the primary action, just idle
    if _acted:
        return {"action": "navigate", "url": "/admin"}

    # ─── Impossible / no_action tasks: do nothing, let agent_response handle it ──
    if _task_id.startswith("imp-"):
        return {"action": "navigate", "url": "/admin"}

    # ─── Navigation tasks ────────────────────────────────────────────
    if _task_id.startswith("nav-"):
        return _handle_navigation(goal)

    # ─── Retrieval tasks: navigate to see data, then stop ────────────
    if _task_id.startswith("ret-") or _task_id.startswith("srch-"):
        return {"action": "navigate", "url": "/admin"}

    # ─── Product tasks ───────────────────────────────────────────────
    if _task_id.startswith("prod-"):
        return _act(_handle_product(goal, data))

    # ─── Order tasks ─────────────────────────────────────────────────
    if _task_id.startswith("ord-"):
        return _act(_handle_order(goal, data))

    # ─── Customer tasks ──────────────────────────────────────────────
    if _task_id.startswith("cust-"):
        return _act(_handle_customer(goal, data))

    # ─── Discount tasks ──────────────────────────────────────────────
    if _task_id.startswith("disc-"):
        return _act(_handle_discount(goal, data))

    # ─── Settings tasks ──────────────────────────────────────────────
    if _task_id.startswith("set-"):
        return _act(_handle_settings(goal))

    # ─── Multi-domain tasks: try to parse the first actionable clause ─
    if _task_id.startswith("multi-"):
        return _act(_handle_multi(goal, data))

    return {"action": "navigate", "url": "/admin"}


def _act(action: dict[str, Any]) -> dict[str, Any]:
    """Mark that a real action was taken (won't repeat)."""
    global _acted
    if action.get("action") != "navigate":
        _acted = True
    return action


def agent_response(obs: dict[str, Any], info: dict[str, Any]) -> Optional[str]:
    """Provide a text response for retrieval and impossible tasks."""
    inner = obs.get("observation", obs)
    data = inner.get("data", {})
    goal = _goal.lower()

    # ─── Impossible tasks ────────────────────────────────────────────
    if _task_id.startswith("imp-"):
        return "This task cannot be completed. The requested action is not possible given the current state."

    # ─── Retrieval tasks ─────────────────────────────────────────────
    if _task_id.startswith("ret-") or _task_id.startswith("srch-"):
        return _answer_retrieval(goal, data)

    return None


# ═════════════════════════════════════════════════════════════════════
# HANDLERS
# ═════════════════════════════════════════════════════════════════════

def _handle_navigation(goal: str) -> dict:
    pages = {
        "product": "/admin/products",
        "order": "/admin/orders",
        "customer": "/admin/customers",
        "discount": "/admin/discounts",
        "setting": "/admin/settings",
        "marketing": "/admin/marketing",
        "analytics": "/admin/analytics",
        "content": "/admin/content",
        "home": "/admin",
        "dashboard": "/admin",
    }
    for keyword, url in pages.items():
        if keyword in goal:
            return {"action": "navigate", "url": url}
    return {"action": "navigate", "url": "/admin"}


def _handle_product(goal: str, data: dict) -> dict:
    products = data.get("products", [])

    # Parse product name from quotes
    name = _extract_quoted(goal)
    pid = _find_id_by_field(products, "title", name) if name else None

    # ─── Create product ──────────────────────────────────────────
    if "create" in goal or "add a new" in goal or "add a " in goal:
        fields: dict[str, Any] = {}
        if name:
            fields["title"] = name
        price = _extract_price(goal)
        if price:
            fields["price"] = price
        fields["status"] = "draft" if "draft" in goal else "active"
        if "vendor" in goal:
            vendor = _extract_quoted(goal, after="vendor")
            if vendor:
                fields["vendor"] = vendor
        return {"action": "create_product", **fields}

    # ─── Delete product ──────────────────────────────────────────
    if "delete" in goal or "remove" in goal:
        if pid:
            return {"action": "delete_product", "productId": pid}

    # ─── Update product ──────────────────────────────────────────
    if pid:
        fields = {}
        # Price change — extract the target price (after "to")
        if "price" in goal:
            price = _extract_price_after(goal, "to") or _extract_price(goal)
            if price:
                fields["price"] = price
        # Status change
        for status in ["draft", "archived", "active"]:
            if status in goal and "status" in goal:
                fields["status"] = status
                break
        # Vendor change
        if "vendor" in goal:
            new_vendor = _extract_quoted(goal, after="to") or _extract_quoted(goal, after="vendor")
            if new_vendor:
                fields["vendor"] = new_vendor
        # Title rename
        if "rename" in goal:
            new_title = _extract_quoted(goal, after="to")
            if new_title:
                fields["title"] = new_title
        # Inventory
        inv = _extract_number_after(goal, "inventory", "to")
        if inv is not None:
            fields["inventory"] = inv
        # Type
        if "type" in goal:
            new_type = _extract_quoted(goal, after="type") or _extract_quoted(goal, after="to")
            if new_type:
                fields["productType"] = new_type

        if fields:
            return {"action": "update_product", "productId": pid, "fields": fields}

    # Fallback: try to update all products matching a pattern
    if "all" in goal:
        return _handle_bulk_product(goal, products)

    return {"action": "navigate", "url": "/admin/products"}


def _handle_bulk_product(goal: str, products: list) -> dict:
    """Handle 'all products' type goals — just do the first matching one."""
    for p in products:
        if p.get("status") == "active":
            fields = {}
            if "price" in goal and "10%" in goal:
                price = float(p.get("price", 0))
                fields["price"] = str(round(price * 1.1, 2))
            if "draft" in goal and "status" in goal:
                fields["status"] = "draft"
            if "archived" in goal:
                fields["status"] = "archived"
            if fields:
                return {"action": "update_product", "productId": p["id"], "fields": fields}
    return {"action": "navigate", "url": "/admin/products"}


def _handle_order(goal: str, data: dict) -> dict:
    orders = data.get("orders", [])
    order_num = _extract_order_number(goal)
    oid = _find_id_by_field(orders, "orderNumber", order_num) if order_num else None

    if not oid and orders:
        oid = orders[0]["id"]

    if "fulfill" in goal and oid:
        return {"action": "fulfill_order", "orderId": oid}
    if "capture" in goal and oid:
        return {"action": "capture_payment", "orderId": oid}
    if "refund" in goal and oid:
        return {"action": "refund_order", "orderId": oid}
    if "note" in goal and oid:
        note_text = _extract_quoted(goal) or "Note added by agent"
        return {"action": "add_order_note", "orderId": oid, "message": note_text}

    return {"action": "navigate", "url": "/admin/orders"}


def _handle_customer(goal: str, data: dict) -> dict:
    customers = data.get("customers", [])

    if "create" in goal or "add" in goal:
        name = _extract_quoted(goal) or "New Customer"
        parts = name.split(" ", 1)
        fields: dict[str, Any] = {"firstName": parts[0], "lastName": parts[1] if len(parts) > 1 else ""}
        email = _extract_pattern(goal, r'[\w.-]+@[\w.-]+')
        if email:
            fields["email"] = email
        return {"action": "create_customer", "fields": fields}

    # Update customer — try to find by name in the data
    name = _extract_quoted(_goal)
    cid = _find_id_by_field(customers, "name", name) if name else None
    # Fallback: try matching customer names from data against the goal
    if not cid:
        for cu in customers:
            if cu.get("name", "").lower() in _goal.lower():
                cid = cu["id"]
                break
    if cid:
        fields = {}
        if "phone" in goal:
            phone = _extract_quoted(_goal, after="to") or _extract_quoted(_goal)
            if phone:
                fields["phone"] = phone
        if "tag" in goal:
            tag = _extract_quoted(_goal, after="tag")
            if tag:
                fields["tags"] = [tag]
        if "email" in goal:
            email = _extract_pattern(_goal, r'[\w.-]+@[\w.-]+')
            if email:
                fields["email"] = email
        if "name" in goal and "rename" in goal:
            new_name = _extract_quoted(_goal, after="to")
            if new_name:
                fields["firstName"] = new_name.split()[0]
                fields["lastName"] = " ".join(new_name.split()[1:])
        if fields:
            return {"action": "update_customer", "customerId": cid, "fields": fields}

    return {"action": "navigate", "url": "/admin/customers"}


def _handle_discount(goal: str, data: dict) -> dict:
    if "create" in goal or "add" in goal:
        code = _extract_quoted(goal) or _extract_pattern(goal, r"code\s+['\"]?(\w+)['\"]?")
        fields: dict[str, Any] = {
            "title": code or "New Discount",
            "code": (code or "NEWCODE").upper(),
            "type": "percentage" if "%" in goal or "percent" in goal else "fixed_amount",
            "valueType": "percentage" if "%" in goal or "percent" in goal else "fixed",
            "status": "active",
        }
        val = _extract_price(goal) or _extract_pattern(goal, r'(\d+)%')
        if val:
            fields["value"] = float(val)
        return {"action": "create_discount", "fields": fields}

    return {"action": "navigate", "url": "/admin/discounts"}


def _handle_settings(goal: str) -> dict:
    fields: dict[str, Any] = {}
    # Use _goal (original case) for extracting values
    if "store name" in goal or "storename" in goal:
        name = _extract_quoted(_goal, after="to") or _extract_quoted(_goal)
        if name:
            fields["storeName"] = name
    if "currency" in goal:
        curr = _extract_quoted(_goal, after="to") or _extract_quoted(_goal)
        if curr:
            fields["currency"] = curr
    if "email" in goal:
        email = _extract_pattern(_goal, r'[\w.-]+@[\w.-]+')
        if email:
            fields["storeEmail"] = email
    if fields:
        return {"action": "update_settings", "fields": fields}
    return {"action": "navigate", "url": "/admin/settings"}


def _handle_multi(goal: str, data: dict) -> dict:
    """Multi-domain: try the first recognizable action."""
    if "product" in goal and ("create" in goal or "price" in goal or "update" in goal):
        return _handle_product(goal, data)
    if "order" in goal and ("fulfill" in goal or "refund" in goal or "capture" in goal):
        return _handle_order(goal, data)
    if "customer" in goal:
        return _handle_customer(goal, data)
    if "discount" in goal:
        return _handle_discount(goal, data)
    if "setting" in goal:
        return _handle_settings(goal)
    return {"action": "navigate", "url": "/admin"}


# ═════════════════════════════════════════════════════════════════════
# RETRIEVAL ANSWERING
# ═════════════════════════════════════════════════════════════════════

def _answer_retrieval(goal: str, data: dict) -> str:
    products = data.get("products", [])
    orders = data.get("orders", [])
    customers = data.get("customers", [])
    discounts = data.get("discounts", [])

    name = _extract_quoted(_goal)  # Use original case

    # "What is the price of X?"
    if "price" in goal and name:
        p = _find_by_field(products, "title", name)
        if p:
            return f"${p['price']}"

    # "Who is the vendor of X?"
    if "vendor" in goal and name:
        p = _find_by_field(products, "title", name)
        if p:
            return p.get("vendor", "Unknown")

    # "Who placed order #X?"
    if "who" in goal and "order" in goal:
        onum = _extract_order_number(goal)
        o = _find_by_field(orders, "orderNumber", onum) if onum else None
        if o:
            return o.get("customer", "Unknown")

    # "How many products does X sell?" (vendor count)
    if "how many" in goal and "product" in goal:
        vendor = name
        if vendor:
            count = sum(1 for p in products if p.get("vendor", "").lower() == vendor.lower())
            return str(count)

    # "What is the status of X?"
    if "status" in goal and name:
        p = _find_by_field(products, "title", name)
        if p:
            return p.get("status", "Unknown")

    # "How many orders are unfulfilled?"
    if "unfulfilled" in goal:
        count = sum(1 for o in orders if o.get("fulfillmentStatus") == "unfulfilled")
        return str(count)

    # "How many customers?"
    if "how many" in goal and "customer" in goal:
        return str(len(customers))

    # "What is the total inventory value?"
    if "inventory value" in goal or "total value" in goal:
        total = sum(float(p.get("price", 0)) * int(p.get("inventory", 0)) for p in products)
        return f"${total:,.2f}"

    # "How many active discounts?"
    if "discount" in goal and ("how many" in goal or "active" in goal):
        count = sum(1 for d in discounts if d.get("status") == "active")
        return str(count)

    # Generic: try to find any entity with the quoted name and return its info
    if name:
        for p in products:
            if name.lower() in p.get("title", "").lower():
                return str(p)

    return "Unable to determine the answer from the available data."


# ═════════════════════════════════════════════════════════════════════
# HELPERS
# ═════════════════════════════════════════════════════════════════════

def _extract_quoted(text: str, after: Optional[str] = None) -> Optional[str]:
    """Extract text in single or double quotes, optionally after a keyword."""
    if after:
        idx = text.lower().find(after.lower())
        if idx >= 0:
            text = text[idx:]
    match = re.search(r"['\"]([^'\"]+)['\"]", text)
    return match.group(1) if match else None


def _extract_price(text: str) -> Optional[str]:
    """Extract a dollar amount like $34.99 or 34.99."""
    match = re.search(r'\$?([\d,]+\.?\d*)', text)
    if match:
        return match.group(1).replace(",", "")
    return None


def _extract_price_after(text: str, keyword: str) -> Optional[str]:
    """Extract a dollar amount after a keyword (e.g., 'to $34.99')."""
    # Use word boundary to avoid matching 'to' inside 'Cotton'
    match = re.search(rf'\b{keyword}\b', text, re.IGNORECASE)
    if match:
        return _extract_price(text[match.end():])
    return None


def _extract_order_number(text: str) -> Optional[str]:
    """Extract order number like #1042."""
    match = re.search(r'#(\d+)', text)
    return match.group(1) if match else None


def _extract_number_after(text: str, *keywords: str) -> Optional[int]:
    """Extract a number following specific keywords."""
    for kw in keywords:
        match = re.search(rf'{kw}\s+(?:to\s+)?(\d+)', text, re.IGNORECASE)
        if match:
            return int(match.group(1))
    return None


def _extract_pattern(text: str, pattern: str) -> Optional[str]:
    """Extract first regex match."""
    match = re.search(pattern, text)
    return match.group(1) if match and match.lastindex else (match.group(0) if match else None)


def _find_id_by_field(items: list, field: str, value: Optional[str]) -> Optional[str]:
    """Find an item's ID by matching a field value (case-insensitive)."""
    if not value:
        return None
    val_lower = value.lower().strip()
    for item in items:
        if str(item.get(field, "")).lower().strip() == val_lower:
            return item.get("id")
    # Partial match fallback
    for item in items:
        if val_lower in str(item.get(field, "")).lower():
            return item.get("id")
    return None


def _find_by_field(items: list, field: str, value: Optional[str]) -> Optional[dict]:
    """Find an item by matching a field value."""
    if not value:
        return None
    val_lower = value.lower().strip()
    for item in items:
        if str(item.get(field, "")).lower().strip() == val_lower:
            return item
    for item in items:
        if val_lower in str(item.get(field, "")).lower():
            return item
    return None

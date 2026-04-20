import { CodeBlock } from "@/components/docs/code-block";

export default function APIThreadsPage() {
  return (
    <>
      <h1>Conversation Threads API</h1>
      <p>
        Conversation threads group related traces across a user, session, or
        external conversation ID. They are useful when you want a stable entity
        above individual runs.
      </p>

      <h2>List Threads</h2>
      <CodeBlock lang="bash">
        {`curl "https://api.theta-observability.com/v1/projects/proj_123/threads?limit=100" \\
  -H "Authorization: Bearer <jwt>"`}
      </CodeBlock>

      <h2>Create Thread</h2>
      <CodeBlock lang="json">
        {`{
  "title": "Support escalation",
  "external_id": "conv_123",
  "user_id": "usr_42",
  "session_id": "sess_abc",
  "trace_ids": ["tr_1", "tr_2"],
  "metadata": {
    "channel": "desktop"
  }
}`}
      </CodeBlock>

      <h2>Update and Delete</h2>
      <p>
        Use <code>PATCH /v1/threads/:thread_id</code> to change labels or linked traces,
        and <code>DELETE /v1/threads/:thread_id</code> to remove a thread.
      </p>
    </>
  );
}

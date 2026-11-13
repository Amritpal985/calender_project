import { CalendarDays, Terminal } from 'lucide-react'

export default function SetupScreen() {
  return (
    <div className="auth-page">
      <div className="auth-glow" aria-hidden="true" />
      <div className="setup-card">
        <div className="auth-brand">
          <span className="brand-mark large">
            <CalendarDays size={22} />
          </span>
          <div>
            <h1>SSC CGL Tracker</h1>
            <p>Almost there — connect your Supabase project</p>
          </div>
        </div>

        <ol className="setup-steps">
          <li>
            Create a project at <strong>supabase.com</strong>.
          </li>
          <li>
            Open <em>Project Settings → API</em> and copy the project URL and
            the <code>anon</code> public key.
          </li>
          <li>
            Create a <code>.env</code> file in the project root:
            <pre>
              <code>{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...`}</code>
            </pre>
          </li>
          <li>
            Then restart the dev server with <code>npm run dev</code>. For the
            deployed site, add the same two values as GitHub repository secrets
            (<code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code>).
          </li>
          <li>
            Run <code>supabase/schema.sql</code> in the Supabase SQL editor
            once. See <code>README.md</code> for the full walkthrough.
          </li>
        </ol>

        <p className="setup-hint">
          <Terminal size={14} /> This screen appears only until the environment
          variables are set.
        </p>
      </div>
    </div>
  )
}

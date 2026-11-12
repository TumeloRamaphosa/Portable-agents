import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { StatusDots } from "./StatusDots";
import { AgentPods } from "./AgentPods";
import { loadSettings } from "../lib/settings";
import { hasVaultPath } from "../lib/settings";

export function Layout() {
  const hermes = loadSettings().hermesUrl;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-col">
        <header className="header">
          <StatusDots />
          {hermes ? (
            <a href={hermes} target="_blank" rel="noreferrer" className="btn">
              Hermes
            </a>
          ) : (
            <Link to="/settings" className="btn">
              Hermes (configure)
            </Link>
          )}
        </header>
        <main className="content">
          {!hasVaultPath() && (
            <div className="banner warn">
              Vault path unset. Set it in Settings, then run{" "}
              <code>npm run vault:init</code> from <code>apps/studex-studio/app</code> with{" "}
              <code>VAULT_PATH</code> exported.
            </div>
          )}
          <Outlet />
        </main>
        <AgentPods />
      </div>
    </div>
  );
}

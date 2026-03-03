import packageJson from "../../package.json";

function AppVersion() {
  return (
    <div className="app-version" aria-label={`Versão do frontend ${packageJson.version}`}>
      v{packageJson.version}
    </div>
  );
}

export default AppVersion;

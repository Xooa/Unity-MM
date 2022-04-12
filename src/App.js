import "./App.css";
import Unity, { UnityContext } from "react-unity-webgl";
import MetaMaskAuth from "./MetaMaskAuth";

const unityContext = new UnityContext({
  loaderUrl: "../public/WebGL/Build/WebGL.loader.js",
  dataUrl: "../public/WebGL/Build/WebGL.data.gz",
  frameworkUrl: "../public/WebGL/Build/WebGL.framework.js.gz",
  codeUrl: "../public/WebGL/Build/WebGL.wasm.gz",
});

const tryRequire = (path) => {
  try {
    require(`${path}`);
    return true;
  } catch (err) {
    return null;
  }
};

const onAddressChanged = (address) => {
  try {
    // call API
    console.log("address change", address);
  } catch (err) {
    return null;
  }
};

function App() {
  // return (
  //   <div className="App">
  //     <header className="App-header">
  //       <Unity unityContext={unityContext} />
  //     </header>
  //   </div>
  // );

  return (
    <div className="App">
      <header className="App-header">
        <MetaMaskAuth
          onAddressChanged={onAddressChanged}
        />
      </header>
    </div>
  );
}

export default App;

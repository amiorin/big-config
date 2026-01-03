import * as squint_core from 'squint-cljs/core.js';
import * as MyComponent from './my_component.jsx';
import { createRoot } from 'react-dom/client';
import './style.css';
var root = createRoot(document.getElementById("app"));
root.render(<MyComponent.MyComponent></MyComponent.MyComponent>);

export { root }

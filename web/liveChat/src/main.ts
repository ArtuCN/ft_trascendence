import { App } from './App';
import TestDiv from './components/Testdiv';
import SocketComponent from './components/SocketComponent';

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.appendComponent(TestDiv);
  app.appendComponent(SocketComponent);
});

//app
export type Component = () => HTMLElement;

export class App {
	private root: HTMLElement;

	constructor() {
		this.root = document.getElementById('app') 
			|| this.createRoot();
	}
	
	private createRoot(): HTMLElement {
		const root = document.createElement('div');
		root.id = 'app';
		document.body.appendChild(root);
		return (root);
	}

	public appendComponent(component: Component) {
		this.root.appendChild(component());
	}
}

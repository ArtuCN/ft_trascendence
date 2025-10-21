export type Component = () => HTMLElement;
export declare class App {
    private root;
    constructor();
    private createRoot;
    appendComponent(component: Component): void;
}

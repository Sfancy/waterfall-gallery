declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "bun" {
  interface Env {
    DATA_PATH: string;
  }
}

export function errorHelper(messsage: string, error: unknown) {
  //TODO: improve error notifications
  throw new Error(`messsage ${error}`);
}

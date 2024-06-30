export abstract class Strategy {
  public abstract execute(): Promise<void>;
}

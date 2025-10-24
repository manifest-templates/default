import { createEntityClient } from "../utils/entityWrapper";
import schema from "./Example.json";
export const Example = createEntityClient("Example", schema);

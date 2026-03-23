export interface ListItem {
  id: number | string | boolean;
  name: string;
  [key: string]: unknown;
}

export interface ListGroup {
  label: string;
  items: ListItem[];
}

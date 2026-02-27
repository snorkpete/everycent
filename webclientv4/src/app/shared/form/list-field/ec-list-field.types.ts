export interface ListItem {
  id: number;
  name: string;
  [key: string]: unknown;
}

export interface ListGroup {
  label: string;
  items: ListItem[];
}

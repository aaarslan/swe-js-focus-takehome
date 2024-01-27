export type MenuItem = {
  id: number;
  title: string;
  description: string;
  isGroupOrder: boolean;
  minOrderQty: number;
  maxOrderQty: number;
};

export type Shop = {
  slug: string;
  minNumPeople: number;
  maxNumPeople: number;
  showBaby: boolean;
  showChild: boolean;
  showSenior: boolean;
};

export type Store = {
  shop: Shop;
  menu: MenuItem[];
};

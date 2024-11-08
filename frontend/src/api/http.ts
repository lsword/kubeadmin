export interface HttpResponse<T = unknown> {
  // [x: string]: any;
  msg: string;
  code: number;
  data: T;
};
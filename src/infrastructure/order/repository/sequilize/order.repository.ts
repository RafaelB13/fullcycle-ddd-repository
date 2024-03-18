import RepositoryInterface from "../../../../domain/@shared/repository/repository-interface";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

interface OrderRepositoryInterface extends RepositoryInterface<Order> {}


export default class OrderRepository implements OrderRepositoryInterface {
  async update(entity: Order): Promise<void> {
    const order = await OrderModel.findByPk(entity.id);
    if (!order) {
      throw new Error("Order not found");
    }

    await order.update({
      customer_id: entity.customerId,
      total: entity.total(),
      order: entity.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
      })),
    });
  }

  async find(id: string): Promise<Order> {
    const order = await OrderModel.findByPk(id, {
      include: [{ model: OrderItemModel }],
    });

    if (!order) {
      throw new Error("Order not found");
    }
    
    return new Order(
      order.id,
      order.customer_id, 
      order.items.map((item) => new OrderItem(
        item.id,
        item.name,
        item.price,
        item.product_id,
        item.quantity
      ))
    );
  }

  async findAll(): Promise<Order[]> {
    const orders = await OrderModel.findAll({
      include: [{ model: OrderItemModel }],
    });
    return orders.map((order) => {
      return new Order(
        order.id,
        order.customer_id,
        order.items.map((item) => new OrderItem(
          item.id,
          item.name,
          item.price,
          item.product_id,
          item.quantity,
        ))
      );
    });
  }

  
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }
}

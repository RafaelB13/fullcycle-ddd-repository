import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerChangedEvent from "../customer-changed.event";

export default class SendConsoleLogHandler 
  implements EventHandlerInterface<CustomerChangedEvent> {
  
    handle(event: CustomerChangedEvent): void {
    console.log(`Endereço do cliente: ${event.eventData.customer.id}, ${event.eventData.customer.name}, foi alterado para: ${event.eventData.customer.Address}`)
  }
}
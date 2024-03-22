import Customer from "../../customer/entity/customer";
import CustomerChangedEvent from "../../customer/event/customer-changed.event";
import CustomerCreatedEvent from "../../customer/event/customer-created.event";
import SendConsoleLogHandler from "../../customer/event/handler/send-console-log.handler";
import SendConsoleLog1Handler from "../../customer/event/handler/send-console-log1.handler";
import SendConsoleLog2Handler from "../../customer/event/handler/send-console-log2.handler";
import Address from "../../customer/value-object/address";
import SendEmailWhenProductIsCreatedHandler from "../../product/event/handler/send-email-when-product-is-created.handler";
import ProductCreatedEvent from "../../product/event/product-created.event";
import EventDispatcher from "./event-dispatcher";

describe("Domain events tests", () => {
  it("should register an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();
    const eventHandlerCustomerLog1 = new SendConsoleLog1Handler();
    const eventHandlerCustomerLog2 = new SendConsoleLog2Handler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    eventDispatcher.register(
      "CustomerCreatedEvent",
      eventHandlerCustomerLog1
    );
    eventDispatcher.register(
      "CustomerCreatedEvent",
      eventHandlerCustomerLog2
    );

    // Check if CustomerCreatedEventLog1 has been registered
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"]
    ).toBeDefined();
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length
    ).toBe(2);
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandlerCustomerLog1);

    // Check if CustomerCreatedEventLog2 has been registered
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"]
    ).toBeDefined();
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length
    ).toBe(2);
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandlerCustomerLog2);

    // Check if ProductCreatedEvent has been registered
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      1
    );
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);
  });


  it("should unregister an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();
    const eventHandlerCustomerLog1 = new SendConsoleLog1Handler();
    const eventHandlerCustomerLog2 = new SendConsoleLog2Handler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler)

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregister("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      0
    );

    eventDispatcher.register("CustomerCreatedEvent", eventHandlerCustomerLog1);
    eventDispatcher.register("CustomerCreatedEvent", eventHandlerCustomerLog2);

    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]).toMatchObject(eventHandlerCustomerLog1);
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]).toMatchObject(eventHandlerCustomerLog2);

    eventDispatcher.unregister("CustomerCreatedEvent", eventHandlerCustomerLog1);
    eventDispatcher.unregister("CustomerCreatedEvent", eventHandlerCustomerLog2);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"]
    ).toBeDefined();
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length
    ).toBe(0);
  });

  it("should unregister all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();
    const eventHandlerCustomerLog1 = new SendConsoleLog1Handler();
    const eventHandlerCustomerLog2 = new SendConsoleLog2Handler();
    const eventHandlerCustomerChangedAddress = new SendConsoleLogHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);
    eventDispatcher.register("CustomerCreatedEvent", eventHandlerCustomerLog1);
    eventDispatcher.register("CustomerCreatedEvent", eventHandlerCustomerLog2);
    eventDispatcher.register("CustomerChangedEvent", eventHandlerCustomerChangedAddress);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]).toMatchObject(eventHandlerCustomerLog1);
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]).toMatchObject(eventHandlerCustomerLog2);

    expect(eventDispatcher.getEventHandlers["CustomerChangedEvent"][0]).toMatchObject(eventHandlerCustomerChangedAddress);

    eventDispatcher.unregisterAll();

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeUndefined();
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"]
    ).toBeUndefined();
    expect(
      eventDispatcher.getEventHandlers["CustomerChangedEvent"]
    ).toBeUndefined();
  });
 
  it("should notify all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();
    const eventHandlerCustomerLog1 = new SendConsoleLog1Handler();
    const eventHandlerCustomerLog2 = new SendConsoleLog2Handler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    eventDispatcher.register("CustomerCreatedEvent", eventHandlerCustomerLog1);
    eventDispatcher.register("CustomerCreatedEvent", eventHandlerCustomerLog2);


    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandlerCustomerLog1);

    const address = new Address("Rua 1", 1, "City 1", "State 1");
    const customer = new Customer("1", "Customer 1");

    customer.changeAddress(address);

    const customerCreatedEvent = new CustomerCreatedEvent({
      customer,
    });

    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]).toMatchObject(eventHandlerCustomerLog1);
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]).toMatchObject(eventHandlerCustomerLog2);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    const productCreatedEvent = new ProductCreatedEvent({
      name: "Product 1",
      description: "Product 1 description",
      price: 10.0,
    });

    // Quando o notify for executado o SendEmailWhenProductIsCreatedHandler.handle() deve ser chamado
    eventDispatcher.notify(productCreatedEvent);

    // Quando o notify for executado o SendConsoleLog1Handler.handle() deve ser chamado
    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  });



  // FIZ A SEPARAÇÃO DO EVENTO DE ALTERAÇÃO DO ENDEREÇO POIS O TESTE JÁ ESTAVA MUITO GRANDE
  // DEIXEI APENAS A PARTE DE UNREGISTER ALL
  it("should register customer address changed", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandlerCustomerChangedAddress = new SendConsoleLogHandler();

    eventDispatcher.register(
      "CustomerChangedEvent",
      eventHandlerCustomerChangedAddress
    );

    expect(
      eventDispatcher.getEventHandlers["CustomerChangedEvent"]
    ).toBeDefined();
    expect(
      eventDispatcher.getEventHandlers["CustomerChangedEvent"].length
    ).toBe(1);
    expect(
      eventDispatcher.getEventHandlers["CustomerChangedEvent"][0]
    ).toMatchObject(eventHandlerCustomerChangedAddress);
  });

  it("should unregister customer address changed", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandlerCustomerChangedAddress = new SendConsoleLogHandler();

    eventDispatcher.register(
      "CustomerChangedEvent",
      eventHandlerCustomerChangedAddress
    );

    expect(
      eventDispatcher.getEventHandlers["CustomerChangedEvent"][0]
    ).toMatchObject(eventHandlerCustomerChangedAddress);

    eventDispatcher.unregister(
      "CustomerChangedEvent",
      eventHandlerCustomerChangedAddress
    );

    expect(
      eventDispatcher.getEventHandlers["CustomerChangedEvent"].length
    ).toBe(0);
  });

  it("should notify when a customer was changed address", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandlerCustomerChangedAddress = new SendConsoleLogHandler();
    const spyEventHandler = jest.spyOn(eventHandlerCustomerChangedAddress, "handle");

    eventDispatcher.register(
      "CustomerChangedEvent",
      eventHandlerCustomerChangedAddress
    );

    expect(
      eventDispatcher.getEventHandlers["CustomerChangedEvent"][0]
    ).toMatchObject(eventHandlerCustomerChangedAddress);

    const address = new Address("Rua 1", 1, "City 1", "State 1");
    const customer = new Customer("1", "Customer 1");

    customer.changeAddress(address);

    const customerChangedAddressEvent = new CustomerChangedEvent({
      customer,
    });

    eventDispatcher.notify(customerChangedAddressEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  });
});

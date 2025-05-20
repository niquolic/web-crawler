import amqplib from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

export async function sendToQueue(queue, message) {
  const conn = await amqplib.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  console.log('Message sent:', message);
  setTimeout(() => conn.close(), 500);
}

export async function consumeQueue(queue, onMessage) {
  const conn = await amqplib.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  await channel.assertQueue(queue, { durable: true });
  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      try {
        console.log('Received message:', msg.content.toString());
        const parsedMessage = JSON.parse(msg.content.toString());
        await onMessage(parsedMessage);
        channel.ack(msg);
      } catch (err) {
        console.error('Worker error:', err);
        channel.nack(msg);
      }
    }
  });
}

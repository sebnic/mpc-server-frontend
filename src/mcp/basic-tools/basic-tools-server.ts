// Basic utility tools server
export const basicToolsSchema = [
  {
    name: 'get_time',
    description: 'Get the current time',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'echo',
    description: 'Echo a message back',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Message to echo',
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'calculate',
    description: 'Perform basic arithmetic operations',
    inputSchema: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['add', 'subtract', 'multiply', 'divide'],
          description: 'The operation to perform',
        },
        a: {
          type: 'number',
          description: 'First number',
        },
        b: {
          type: 'number',
          description: 'Second number',
        },
      },
      required: ['operation', 'a', 'b'],
    },
  },
];

export async function handleBasicTool(name: string, args: any): Promise<any> {
  switch (name) {
    case 'get_time':
      return {
        content: [
          {
            type: 'text',
            text: new Date().toLocaleString(),
          },
        ],
      };

    case 'echo':
      return {
        content: [
          {
            type: 'text',
            text: (args as { message: string }).message,
          },
        ],
      };

    case 'calculate': {
      const { operation, a, b } = args as { operation: string; a: number; b: number };
      let result: number;

      switch (operation) {
        case 'add':
          result = a + b;
          break;
        case 'subtract':
          result = a - b;
          break;
        case 'multiply':
          result = a * b;
          break;
        case 'divide':
          if (b === 0) {
            throw new Error('Division by zero');
          }
          result = a / b;
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `${a} ${operation} ${b} = ${result}`,
          },
        ],
      };
    }

    default:
      return null; // Not a basic tool
  }
}

import { DirectoryChildNode } from '@replit/extensions';
import { useReplit } from '@replit/extensions-react';
import { useState, FormEvent, ChangeEvent } from 'react';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';

import './SimpleCss.css'
import { ChatGPTClient } from './ChatGPTClient';
import CodeMetadata from './CodeMetadata';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [entityValue, setEntityValue] = useState('');
  const [htmlValue, setHtmlValue] = useState<React.ReactNode[]>([]);

  // Handshake status, error (if any), and Replit API wrapper
  const { status, error, replit } = useReplit();

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  const handleEntityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEntityValue(event.target.value);
  };

  const handleAction = async (code: string, file: string, action: string) => {
    if (replit) {
      if (action === 'execute') {
        // Execute the code as bash
        try {
          const output = await replit.exec.exec(code);
          alert(output.output);
        } catch (error) {
          alert('An error occurred: ' + error);
        }
      } else if (action === 'replace') {
        // Replace the file with the code. Create file and directory if not exists
        const output = await replit.fs.writeFile(file, code);
        alert(output);

        // Force refresh
        replit.fs.writeFile(file, code)
      } else if (action === 'append') {
        // read file
        const f = await replit.fs.readFile(file);
        if (('error' in f) && (f.error !== null)) {
          alert(f.error);
        } else {
          if (('content' in f) && (f.content !== null)) {
            let message = `
              inserta la siguiente funcion llamada code1 en el código code2:
              
              <code1>${code}</code2>
              
              <code2>${f.content}</code2>
              `;

            console.log('message' + message);

            // Call the ChatGPT API
            const chatGptMessages = [
              {
                role: ChatCompletionRequestMessageRoleEnum.System,
                content: 'You are a helpful assistant.',
              },
              {
                role: ChatCompletionRequestMessageRoleEnum.User,
                content: message,
              },
            ];

            const client = new ChatGPTClient();

            const sendChatRequest = async () => {
              const botResponse = await client.respond(chatGptMessages);
              const response = botResponse?.text?.toString() ?? "";
              // extract text that has ```from response

              const text = response.split("```")[1];

              if (text !== "") {
                const output = await replit.fs.writeFile(file, text);
                alert(output);
                replit.fs.writeFile(file, botResponse?.text?.toString() ?? "");
              }
            };

            sendChatRequest();
          }
        }
      }
    }
  }

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Call the ChatGPT API
    const chatGptMessages = [
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: 'You are a helpful assistant.',
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: "dame las instrucciones para " + inputValue + " de la entidad " + entityValue + "en rails, sin usar scaffold en un mensaje de 800 tokens. Por favor prece los comandos de rails con bundle exec",
      },
    ];

    const client = new ChatGPTClient();

    const sendChatRequest = async () => {
      const botResponse = await client.respond(chatGptMessages);
      console.log(botResponse?.text?.toString);

      const new_response: React.ReactNode[] = [];
      const responses: string[] = (botResponse?.text?.toString() ?? "").split("```").slice(1);
      new_response.push(<h3>Respuesta</h3>);
      responses.map((a: string, i: number) => {
        if (i % 2 === 0) {
          new_response.push(<CodeMetadata handleAction={handleAction} entity={entityValue} code={a} />);
        } else {
          new_response.push(a);
        }
      });

      if (replit) {
        setHtmlValue(new_response);
      }
    };

    sendChatRequest();

    // Clear the input
    setInputValue('');
    setEntityValue('');
  };


  if (status === "error") {
    return <div className="error">{error?.message}</div>;
  }

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  const renderHTML = (html: React.ReactNode[]) => {
    return (
      <div>{html}</div>
    );
  };

  return (
    <main>
      <h2 className="heading">Mobile Copilot</h2>

      <div>
        <form onSubmit={handleFormSubmit}>
          <textarea value={inputValue} onChange={handleInputChange} placeholder='¿Qué quieres modificar?' />
          <br></br>
          <input type="text" value={entityValue} onChange={handleEntityChange} placeholder='Entidad' />
          <br></br>
          <button type="submit" className="command-button">Send</button>
        </form>

        {renderHTML(htmlValue)}
      </div>
    </main>
  );
}

export default App;
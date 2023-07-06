import { DirectoryChildNode } from '@replit/extensions';
import { useReplit } from '@replit/extensions-react';
import { useState, FormEvent, ChangeEvent } from 'react';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';

import './App.css'
import { ChatGPTClient } from './ChatGPTClient';
import CodeMetadata from './CodeMetadata';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [entityValue, setEntityValue] = useState('');
  const [htmlValue, setHtmlValue] = useState<React.ReactNode[]>([]);

  // An array of file system nodes (files / folders)
  const [rootFsNodes, setRootFsNodes] = useState<Array<DirectoryChildNode>>([]);

  // Handshake status, error (if any), and Replit API wrapper
  const { status, error, replit } = useReplit();

  const createTestDir = async () => {
    if (replit) {
      // Create a directory/folder named 'test' at root level
      await replit.fs.createDir('test');

      // Show a confirmation
      await replit.messages.showConfirm("Folder Created")
    }
  }

  const readRootDir = async () => {
    if (replit) {
      // Read all the files & folders in the Repl's file system at root level
      const { children } = await replit.fs.readDir('.');
      return children;
    }
  }

  const createTestFile = async () => {
    if (replit) {
      // Create a file named 'test-file.txt' at root level containing 'example content'
      await replit.fs.writeFile('test-file.txt', 'example content');

      // Show a confirmation
      await replit.messages.showConfirm("File Created");
    }
  }

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
      } else if (action === 'append') {
        // read file
      
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
        content: "dame las instrucciones para " + inputValue + " de la entidad " + entityValue + "en rails, sin usar scaffold en un mensaje de 800 tokens.",
      },
    ];

    const client = new ChatGPTClient();

    const sendChatRequest = async () => {
      const botResponse = await client.respond(chatGptMessages);
      console.log(botResponse?.text?.toString);

      const new_response: React.ReactNode[] = [];
      const responses: string[] = (botResponse?.text?.toString() ?? "").split("```").slice(1);
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

    // Write the conversation to a file
    // await fs.writeFile('conversation.txt', JSON.stringify(newMessages));

    // Update the messages
    // setMessages(newMessages);
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
      <div className="heading">Mobile Copilot</div>

      <div>
        <form onSubmit={handleFormSubmit}>
          <textarea value={inputValue} onChange={handleInputChange} placeholder='¿Qué quieres modificar?' />
          <br></br>
          <input type="text" value={entityValue} onChange={handleEntityChange} placeholder='Entidad' />
          <br></br>
          <button type="submit" className="command-button">Send</button>
        </form>

        {renderHTML(htmlValue)}

        <div className="buttons">
          <button className="command-button" onClick={async () =>
            await createTestDir()}>mkdir test</button>

          <button className="command-button" onClick={async () =>
            await createTestFile()}>touch ./test-file.txt</button>

          <button className="command-button" onClick={async () => {
            setRootFsNodes(await readRootDir() || [])
          }}>ls -a</button>
        </div>

        {/* Render each filesystem node as a list item */}
        <ul className='files'>
          {rootFsNodes.map((file, index) => (
            <li key={index}>{file.filename}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default App;
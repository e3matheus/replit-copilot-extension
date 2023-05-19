import { DirectoryChildNode } from '@replit/extensions';
import { useReplit } from '@replit/extensions-react';
import { useState } from 'react';
import './App.css'

function App() {
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


  if (status === "error") {
    return <div className="error">{error?.message}</div>;
  }

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <div className="heading">React Replit Extension Starter</div>

      <div>
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
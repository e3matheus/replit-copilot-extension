import * as React from 'react';
import './App.css'

export default function App() {
  const [connected, setConnected] = React.useState(false);
  const [error, setError] = React.useState(null);

  const runRef = React.useRef(0);
  
  React.useEffect(() => {
    // this prevents the effect from running multiple times
    runRef.current += 1;
    if (runRef.current === 1) {
      return;
    }
    
    const replit = window.replit;
    (async () => {
      try {

        await replit.init({permissions: []});
        
        setConnected(true);

        
        // some example replit API calls. comment these out to try them

        // filesystem
        // console.log(await replit.readDir('.'))
        // console.log(await replit.readFile('.replit'))
        // await replit.createDir('testdir')
        // await replit.writeFile('testdir/testfile', 'example content')

        // repldb
        
        // await replit.replDb.set({key: 'test', value: 123});
        // console.log(await replit.replDb.get({key: 'test'}));
        // console.log(await replit.replDb.list({prefix: ''}));

        // graphql (beware that this provides full access to the graph. will be nerfed in the future)
        
        // console.log(await replit.queryGraphql({query: 'query { currentUser {id} } '}))
        // console.log(await replit.mutateGraphql({mutation: `mutation { markAllNotificationsAsSeen {id}}`}))

        // eval (this will be removed for sure lol)
        // console.log(await replit.evalCode({code: 'return 1+1'}))
        
      } catch (e) {
        console.log(e);
        setError(e);
      }
    })()
  }, []);
  
  return (
    <main>
      <div>Example extension</div>
      {error ? (
        <div>error: {error.message ?? error}</div>
      ) : (
        <div>{connected ? 'connected' : 'connecting...'}</div>
      )}
    </main>
  );
}

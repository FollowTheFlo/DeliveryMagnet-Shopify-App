async function handler(req, res) {   
    console.log('data api')
    if (req.method === 'GET') {
      const data = req.body;
      console.log('data', data);
    }
}

export default handler;
const express = require('express');
const cors = require('cors');
const wakeOnLan = require('wake_on_lan');
const ping = require('ping');
const path = require('path');

const app = express();
const port = 3000; 

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Wake-on-LANエンドポイント
app.post('/wake', (req, res) => {
  const { macAddress } = req.body;
  if (!macAddress) {
    return res.status(400).json({ error: 'MACアドレスが必要です' });
  }

  wakeOnLan.wake(macAddress, (error) => {
    if (error) {
      console.error('WOLエラー:', error);
      return res.status(500).json({ error: 'マジックパケット送信失敗' });
    }
    res.json({ message: 'マジックパケット送信成功' });
  });
});

// PingでPCの起動確認
app.post('/ping', (req, res) => {
  const { ipAddress } = req.body;
  if (!ipAddress) {
    return res.status(400).json({ error: 'IPアドレスが必要です' });
  }

  ping.sys.probe(ipAddress, (isAlive) => {
    res.json({ message: isAlive ? 'PCは起動しています' : 'PCは起動していません' });
  });
});

// 全てのインターフェースからの接続を許可
app.listen(port, '0.0.0.0', () => {
  console.log(`Wake-on-LANサーバーが http://0.0.0.0:${port} で起動中`);
});

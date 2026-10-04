import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
if(Number(process.versions.node.split('.')[0])<22){console.error('需要 Node.js 22 以上，請安裝後重新啟動。');process.exit(1);}
try{for(const name of ['yaml','ajv','ajv-formats'])require.resolve(name);}
catch{console.error('尚未安裝完整依賴。請在本專案執行 npm ci，再重新開啟啟動檔。');process.exit(1);}
if(process.argv.includes('--check')){console.log('啟動需求檢查通過。');process.exit(0);}

const port=process.env.PORT||4310;
console.log('持有人價值研究：正在啟動本機服務。');
console.log(`請開啟 http://127.0.0.1:${port}/`);
console.log(`閱讀正式證據：http://127.0.0.1:${port}/?mode=production#research`);
console.log('以 Ctrl+C 停止服務；不會自動取得或套用研究資料。');
const child=spawn(process.execPath,['server.js'],{cwd:root,stdio:'inherit'});
child.on('error',error=>{console.error(`啟動失敗：${error.message}`);process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??1;if(code)console.error('啟動失敗，請檢查上方訊息與連接埠是否已被使用。');});

import express  from 'express';
import  {spawn}  from 'child_process';
import {search} from './model.js';
import bodyParser from "body-parser";
import iconv from "iconv-lite";

const app= express();
const port= 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));


function get_data(num, title){

      var d = title[num];
      var rec = d.split('@');
  
    return {
      "name": rec[1],
      "location": rec[3],
      "date": rec[4],
      "price": rec[5],
      "type": rec[6],
    };
}
function get_keyword(title){

        var d = title[3];
        var rec = d.split('@');

    return {
      1: rec[1],
      2: rec[2],
      3: rec[3],
      4: rec[4],
      5: rec[5],
      6: rec[6],
    };
}
function python(vari, rec1, rec2, rec3, keyword, res){
  vari.stdout.on('data', (data) => {
    final_title = data.toString('utf8').split('#');
    rec1 = get_data(0,final_title);
    rec2 = get_data(1,final_title);
    rec3 = get_data(2,final_title);
    keyword = get_keyword(final_title);
    console.log(rec1,rec2,rec3,keyword);
    console.log(typeof rec1, typeof rec2, typeof rec3, typeof keyword);

 });

 vari.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data}`);
  });

  vari.on('close', (code) => {
   console.log(`Python process exited with code ${code}`);
   var final={rec1, rec2, rec3, keyword}
   console.log(typeof final);
   res.send(final);
  });

}


var final_title;

app.post('/search', function(req, res){
  var title=req.query;
  console.log(title);
  const pythonProcess = spawn('python', ['t.py', title, final_title]);
  var rec1, rec2, rec3, keyword;
  python(pythonProcess, rec1, rec2, rec3, keyword, res);
  
});
    


app.use((req, res, next)=>{
    console.log('');
    res.send("404");
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
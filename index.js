import fs from 'fs'
//Чанк в 15 Мб позволил не превышать 200-250 мб
//upd
//После теста загрузка для текстового файла в 10.8 ГБ используямая память повышалась до 300-350мб. 
//Загрузка для файла в 10.8 ГБ составила 14:39.159 (m:ss.mmm)
const chunk_size = 15*1024*1024;
const file="test_exmpl.txt";
const buffer = Buffer.alloc(chunk_size);
const writeStream = fs.createWriteStream("result_exmpl.txt");

console.time("timer");
fs.open(file,'r',(err,fd)=>{    
    if(err){
        throw err;
    }

    function read(){
        
        function sort(str){            
            //избегаем создание переменных
            return str.split("\r").map(item=>{return item.split("").sort().join("")+"\r"}).join("");            
        }
                
        fs.read(fd,buffer,0,chunk_size,null,(err,bread)=>{
            if(err){
                throw err;
            }

            if(bread === 0){
                console.log("is done");
                fs.close(fd,(err)=>{
                    if(err){
                        throw err;
                    }
                });
                //выход
                console.timeEnd("timer");
                return;
            }

            let data;

            if(bread < chunk_size){
                data = buffer.slice(0, bread);
            }else{
                data = buffer;                                
            }            
            const string_data_sorted = sort(data.toString());                        
            writeStream.write(string_data_sorted);            
            //рекурсия            
            read();            
        });
    }
    read();    
});

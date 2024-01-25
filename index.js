import fs from 'fs'
import os from 'os'

const chunk_size = 4 * 1024 * 1024;
const file = "test_exmpl.txt";
const buffer = Buffer.alloc(chunk_size);

console.time("Время");

try {
    fs.mkdirSync(os.tmpdir + '\\temp_sorted\\');
} catch (error) {


    fs.stat(os.tmpdir + '\\temp_sorted\\', function (err) {
        if (!err) {
            console.log('Уже создано');
        }
        else if (err.code === 'ENOENT') {
            fs.mkdirSync(os.tmpdir + '\\temp_sorted\\');
        }
    });
}

fs.open(file, 'r', (err, fd) => {
    if (err) {
        throw err;
    }

    let i = 1;
    function read() {

        function sort(str) {
            return str.split("\n").sort().join("\n").replace(/[\r]+/g, '');
        }

        fs.read(fd, buffer, 0, chunk_size, null, (err, bread) => {
            if (err) {
                throw err;
            }

            if (bread === 0) {
                fs.close(fd, (err) => {
                    if (err) {
                        throw err;
                    }
                });

                let length = fs.readdirSync(os.tmpdir + '\\temp_sorted\\').length;
                while (length > 0) {

                    fs.readdirSync(os.tmpdir + '\\temp_sorted\\').forEach(file_name => {
                        const file = os.tmpdir + '\\temp_sorted\\' + file_name;
                        let data = fs.readFileSync(file, 'utf-8');
                        if (data.length <= 0) {
                            fs.unlinkSync(file);
                            length--;
                            return;
                        }
                        let data_splited = data.split("\n");
                        let first = data_splited.shift();
                        if (first.length <= 0) {
                            fs.writeFileSync(file, data_splited.join("\n").replace(/[\r]+/g, ''));
                            return;
                        }
                        fs.appendFileSync(os.tmpdir + '\\' + 'unsorted.txt', first);
                        fs.writeFileSync(file, data_splited.join("\n").replace(/[\r]+/g, ''));
                    });

                    if (length > 0) {
                        const unsorted = fs.readFileSync(os.tmpdir + '\\' + 'unsorted.txt').toString();
                        const sorted_all = unsorted.split('\n').sort().join("\n");
                        fs.unlinkSync(os.tmpdir + '\\' + 'unsorted.txt');
                        if (sorted_all.length !== 0) {
                            fs.appendFileSync('result.txt', sorted_all + '\n');
                        }
                    }
                }

                console.log("Конец загрузки!");
                console.timeEnd("Время");
                return;
            }

            let data;

            if (bread < chunk_size) {
                data = buffer.slice(0, bread);
            } else {
                data = buffer;
            }
            const string_data_sorted = sort(data.toString());
            fs.writeFileSync(os.tmpdir + '\\temp_sorted\\' + i + '.txt', string_data_sorted);

            i++;
            read();
        });
    }
    read();
});

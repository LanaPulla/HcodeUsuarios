class UserController{ //vai ligar o model e a interface

    constructor(formId, tableId){

        this.formEl = document.getElementById(formId); //guarada o formulário dentro
        this.tableEl = document.getElementById(tableId); //guarda a tabela de pessoas, onde vai adicionar as linhas

        this.onSubmit(); //vai chamar o método assim que abrir a pag
        this.onEdit();//vai chamar o método para uso 
    }


    onEdit(){

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{
            
            this.showPanelCreate();

        });

    }

    onSubmit(){ //método para adicionar a linha com os dados da pessoa apertando o botão


        this.formEl.addEventListener("submit", event => { 
            //dentro do formulario no evento submit("salvar") faça essa função 
                event.preventDefault(); //PARA o padrão desse evento (o padrão é recarregar a pág no submit)

                let btn = this.formEl.querySelector("[type=submit]"); //seleciona o elemento botão salvar(submit)
                
                btn.disabled = true; //disable vai "trancar" o botão para uso enquanto não for adionada a linha 

                let values = this.getValues(); // Extrai os valores do formulário

                if (!values) return false; // antes de ler a foto, ele verifica se tem algum arquivo

                this.getPhoto().then((content)=>{ 
                    values.photo = content; // Adiciona o conteúdo da foto aos valores do formulário

                    this.addLine(values); //os dados da pessoa para preencher a linha e adicioná-la

                    this.formEl.reset(); //limpa o formulário quando for adicionado a linha

                    btn.disabled = false; //destrava o botão apra uso quando for adicionada a linha
                }, 
                (e) => {

                    console.error(e);

                });
                
            });
        
     }


     getPhoto(){ // método para retorar o arquivo foto do formulário

        return new Promise((resolve, reject)=>{
            
            let fileReader = new FileReader(); // uma instância do FileReader para ler arquivos

            let elements = [...this.formEl.elements].filter(item=>{ // Converte os elementos do formulário em um array e filtra para encontrar o campo de foto.
    
                if (item.name === 'photo') { // se for uma foto retorna
    
                    return item;
                }
    
    
            }); 
    
            let file = elements[0].files[0]; // Obtém o primeiro arquivo do campo de foto, pois pode ser uma coleção
    
            fileReader.onload = ()=>{ //função que será executada quando a leitura do arquivo for concluída. Esta função chama o callback com o resultado da leitura
                 
                resolve(fileReader.result); // Executa o callback com o resultado da leitura do arquivo
                
            };
    
            fileReader.onerror = (e)=>{ // Define uma função que será executada se ocorrer um erro durante a leitura do arquivo


                reject(e);

            }

            if (file) { //se tiver alguma foto no arquivo pegue ela
                
                fileReader.readAsDataURL(file); // Lê o conteúdo do arquivo como um Data URL (base64)
            
            } else { //se não tiver, usa essa aqui

                resolve('dist/img/boxed-bg.jpg');

            }
        });

     }

    getValues(){ //Este método extrai os valores dos campos do formulário e cria um objeto User
        

        let user = {}; //Inicializa um objeto vazio user que irá armazenar os valores do formulário
        let isValid = true; //Inicializa uma variável isValid como true, que será usada para verificar se todos os campos obrigatórios do formulário estão preenchidos

        // os [] sempre se refere a array, é preciso colocar o Spred (...) pq está sendo lido como coleção(pq é uma instancia de array), e não como array, e em coleção não tem forEach
        [...this.formEl.elements].forEach(function (field, index) { //passa sobre cada atributo em 'name'

            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value){ //Verifica se o campo atual (field) é um dos campos obrigatórios ('name', 'email', 'password') e se está 
                 field.parentElement.classList.add('has-error'); //se estiver vazio ele adiciona a classe 'has-error' ao elemento pai do html para mostrar o erro no site
                 isValid = false; //se estiver vazio ele vai mostrar que o campo obrigatório está vazio

            }

            if(field.name == "gender") { //verifica se está passando pelo atributo gender
        
                if (field.checked) // Se o campo de gênero estiver selecionado, adiciona ao objeto 'user' a chave 'gender' com o valor selecionado
                
                    user[field.name] = field.value; // Armazena o valor do campo de gênero no objeto user
        
            } else if(field.name == "admin") { //verifica se é admin o campo
                
                user[field.name] = field.checked; // Armazena o valor booleano (checked) do campo admin no objeto user
                
             } else { //Para todos os outros campos do formulário
        
                user[field.name] = field.value;
                // else pega o valor do resto do formulario e armazena no user 
            }

            
        
        });
        


        if (!isValid){ //Se isValid for false (algum campo obrigatório estiver vazio), retorna false e não continua.
            return false;
        }
        
           return new User( // Cria e retorna uma nova instância da classe User, passando os valores do objeto user como parâmetros.
                user.name, 
                user.gender, 
                user.birth, 
                user.country,
                user.email, 
                user.password,
                user.photo, 
                user.admin
            );


        }

    addLine(dataUser){ //adiciona uma nova linha no formulario de pessoas -- com o nome da função addLine e o parametro de dados do usuário que vao ser utilizados (o parametro é a instancia da classe por causa do objectUser)

        let tr = document.createElement('tr'); //Cria um novo elemento de tabela (tr), que representa uma linha na tabela
        
        tr.dataset.user = JSON.stringify(dataUser); //vai converter o objeto em string JSON 

        tr.innerHTML =  // Atribui o conteúdo HTML à linha da tabela. Aqui está interpretando o elemento 'tr'
                                //innerHTML esta interpretando o elemento tr
                `  
                    <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                    <td>${dataUser.name}</td>
                    <td>${dataUser.email}</td>
                    <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
                    <td>${Utils.dateFormat(dataUser.register)}</td> 
                    <td>
                        <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                        <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
                    </td>
                `;  //dentro das crases ficam os elementos do tr e os dados dos usuarios que devem ser enviados para o formulario
                    //${Utils.dateFormat(dataUser.register)}: Cria uma célula de tabela contendo a data de registro do usuário. A data é formatada pela função Utils.dateFormat.
            
                tr.querySelector(".btn-edit").addEventListener("click", e=>{

                    let json = JSON.parse(tr.dataset.user);
                    let form = document.querySelector("#form-user-update");

                    for (let name in json) {

                        let field = form.querySelector("[name=" + name.replace("_", "") + "]");

                        if (field) {

                           switch (field.type) {
                                case 'file': 
                                continue;
                                break;

                                case 'radio':
                                    field = form.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                                    field.checked = true;
                                break;

                                case 'checkbox':
                                    field.checked = json[name];
                                break;

                                default:
                                    field.value = json[name];
                            }
                            console.log(field.gender);

                        }
                        
                    }

                    this.showPanelUpdate();


                });
                
                this.tableEl.appendChild(tr); //Adiciona a nova linha (tr) à tabela representada por tableEl.

                this.updateCount(); //quando adiconar a linha o método que conta os usuários e os admins, alterará o número zero
       
         }

         showPanelCreate(){ //mostra o formulario de novo usuário

            document.querySelector("#box-user-create").style.display = "block"; // será mostrado o "novo usuário" 
            document.querySelector("#box-user-update").style.display = "none" ;//quando o método for chamado o formulario update ficará invisivel 


         }

         showPanelUpdate(){//mostra o formulario de editar usuário
            
            document.querySelector("#box-user-create").style.display = "none"; //quando o método for chamado o formulario create ficará invisivel 
            document.querySelector("#box-user-update").style.display = "block"; // e será mostrado o editar

            
         }


         updateCount(){
            let numberUsers = 0; //inicia a var que vai contar as iterações do usuário
            let numberAdmin = 0; //inicia a var que vai contar as iterações dos admins

            //spread vai distribuir direitinho nas posições os elementos totais do array [0] [1] etc
            [...this.tableEl.children].forEach(tr=>{ 
                
                numberUsers++;

               let user = JSON.parse(tr.dataset.user);

               if (user._admin) numberAdmin++;


            });
            

            document.querySelector("#number-users").innerHTML = numberUsers; //vai atualizar o valor da quantidade de users no bloco verde
            document.querySelector("#number-users-admin").innerHTML = numberAdmin; //vai atualizar o valor da quantidade de users no bloco amarelo

         }


}



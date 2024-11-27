# Use uma imagem base com Node.js
FROM node:16

# Diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Instalar dependências necessárias e o Oracle Instant Client
RUN apt-get update && apt-get install -y wget unzip libaio1 && \
    wget https://download.oracle.com/otn_software/linux/instantclient/instantclient-basic-linuxx64.zip && \
    unzip instantclient-basic-linuxx64.zip && \
    rm instantclient-basic-linuxx64.zip && \
    mkdir -p /usr/lib/oracle && \
    mv instantclient* /usr/lib/oracle/instantclient && \
    ln -s /usr/lib/oracle/instantclient/libclntsh.so.23.1 /usr/lib/libclntsh.so && \
    ln -s /usr/lib/oracle/instantclient/libocci.so.23.1 /usr/lib/libocci.so

# Configurar a variável de ambiente para localizar o Instant Client
ENV LD_LIBRARY_PATH="/usr/lib/oracle/instantclient:$LD_LIBRARY_PATH"

# Instalar dependências do projeto
COPY package*.json ./
RUN npm install

# Copiar os arquivos do projeto
COPY . .

# Expôr a porta do serviço
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "index.js"]

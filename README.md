# notepad-go
FInal project

# container docker mongodb

docker volume create notepad_mongo_data

docker run -d \
  --name notepad-mongo \
  -p 27017:27017 \
  -v notepad_mongo_data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin \
  mongo:7 \



npx prisma generate
npx prisma db push

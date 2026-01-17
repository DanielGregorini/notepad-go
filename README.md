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


docker exec -it notepad-mongo mongosh
mongosh "mongodb://admin:admin@localhost:27017/notepad?authSource=admin"

show collections

db.slugs.find().pretty()


### notepad-go .env

NEXT_PUBLIC_API_URL=http://localhost:5001


### notepad-go-apu .env

DATABASE_URL=mongodb://admin:admin@localhost:27017/notepad?authSource=admin

TIME_SYNC_ROOM_S=30

TIME_REMOVE_ROOM_D=7

JWT_SECRET=d2xSBjsdmk20La937aj7SGnaf
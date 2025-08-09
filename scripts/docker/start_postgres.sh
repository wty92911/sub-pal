docker run --name some-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sub_pal \
  -p 5432:5432 \
  -d \
  postgres

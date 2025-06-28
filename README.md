# VINZA BE

## Authors

```
- Emmanuel Guerreiro 47262
- Izuel Tomas 47700
- Ozan Giuliana 47856
- Garcia Zacarias 46454
- Passera Nino 46479
```

## How to run

`sudo docker compose -f docker-compose.local.yml up`

### If its the first time

`sudo docker compose -f docker-compose.local.yml up --build`

### If a dependency has been installed

```
sudo docker compose -f docker-compose.local.yml down
sudo docker compose -f docker-compose.local.yml build
sudo docker compose -f docker-compose.local.yml up
```

###### Template based on

https://blog.logrocket.com/express-typescript-node/

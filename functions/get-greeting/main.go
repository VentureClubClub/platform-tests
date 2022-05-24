package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"io/ioutil"

	"github.com/jackc/pgx/v4"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func Handler(ctx context.Context, request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {

	files, _ := ioutil.ReadDir(".")
	// TODO find root.crt absolute path and put it in DATABASE_URL
	// ?ssl=true&sslmode=verify-full&sslrootcert=root.crt
	databaseURL := os.Getenv("DATABASE_URL")
	for _, f := range files {
		log.Println(f.Name(), f.IsDir())
	}

	conn, err := pgx.Connect(context.Background(), databaseURL)
	if err != nil {
		log.Printf("Unable to connect to database: %v\n", err)
		return &events.APIGatewayProxyResponse{
			StatusCode:      500,
			Headers:         map[string]string{"Content-Type": "text/plain"},
			Body:            "500 Server Error",
			IsBase64Encoded: false,
		}, nil

	}

	var greeting string
	err = conn.QueryRow(
		context.Background(),
		"select text from greetings limit 1",
	).Scan(&greeting)

	log.Println("greeting with", greeting)
	return &events.APIGatewayProxyResponse{
		StatusCode:      200,
		Headers:         map[string]string{"Content-Type": "text/plain"},
		Body:            fmt.Sprintf("%v, Venture Club", greeting),
		IsBase64Encoded: false,
	}, nil
}

func main() {
	lambda.Start(Handler)
}

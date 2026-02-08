# Use the official Golang image as the base image
FROM golang:1.25-alpine AS builder
WORKDIR /app
# Copy go.mod and go.sum to the workspace and download dependencies
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o hangman-api . 

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates
WORKDIR /root/
# Copy the built binary from the builder stage
COPY --from=builder /app/hangman-api .

# Expose the port the application runs on
EXPOSE 8080
# Command to run the application
CMD ["./hangman-api"]

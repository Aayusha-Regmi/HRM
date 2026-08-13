#!/bin/bash

# ==========================================
# DevOps Environment Setup Script
# Safe to run multiple times
# ==========================================

set -e

echo "========================================="
echo " Starting DevOps Environment Setup"
echo "========================================="

# -----------------------------
# Update system
# -----------------------------
echo "Updating packages..."
sudo apt update

echo "Installing prerequisites..."
sudo apt install -y \
    unzip \
    lsb-release \
    curl \
    wget \
    gnupg \
    ca-certificates \
    apt-transport-https \
    software-properties-common

# -----------------------------
# Docker
# -----------------------------
if command -v docker >/dev/null 2>&1; then
    echo "Docker already installed."
else
    echo "Installing Docker..."

    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh

    sudo usermod -aG docker $USER
fi

# -----------------------------
# kubectl
# -----------------------------
if command -v kubectl >/dev/null 2>&1; then
    echo "kubectl already installed."
else
    echo "Installing kubectl..."

    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

    chmod +x kubectl
    sudo mv kubectl /usr/local/bin/

    kubectl version --client
fi

# -----------------------------
# KIND
# -----------------------------
if command -v kind >/dev/null 2>&1; then
    echo "KIND already installed."
else
    echo "Installing KIND..."

    curl -Lo kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64

    chmod +x kind
    sudo mv kind /usr/local/bin/

    kind --version
fi

# -----------------------------
# Helm
# -----------------------------
if command -v helm >/dev/null 2>&1; then
    echo "Helm already installed."
else
    echo "Installing Helm..."

    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

    helm version
fi

# -----------------------------
# AWS CLI
# -----------------------------
if command -v aws >/dev/null 2>&1; then
    echo "AWS CLI already installed."
else
    echo "Installing AWS CLI..."

    rm -rf aws awscliv2.zip

    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip

    unzip -q awscliv2.zip

    sudo ./aws/install

    rm -rf aws awscliv2.zip

    aws --version
fi

# -----------------------------
# Terraform
# -----------------------------
# Reference: https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli
if command -v terraform >/dev/null 2>&1; then
    echo "Terraform already installed."
else
    echo "Installing Terraform..."

    # Install HashiCorp's GPG key
    wget -O- https://apt.releases.hashicorp.com/gpg | \
        gpg --dearmor | \
        sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg > /dev/null

    # Add the official HashiCorp repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(grep -oP '(?<=UBUNTU_CODENAME=).*' /etc/os-release || lsb_release -cs) main" | \
        sudo tee /etc/apt/sources.list.d/hashicorp.list

    # Install Terraform from the new repository
    sudo apt update
    sudo apt-get install -y terraform

    terraform -version
fi

# -----------------------------
# Jenkins
# -----------------------------
if sudo docker ps -a --format '{{.Names}}' | grep -q '^jenkins$'; then
    echo "Jenkins container already exists."

    if ! sudo docker ps --format '{{.Names}}' | grep -q '^jenkins$'; then
        echo "Starting Jenkins..."
        sudo docker start jenkins
    fi
else
    echo "Creating Jenkins container..."

    sudo docker volume create jenkins_home

    sudo docker run -d \
        --name jenkins \
        --restart unless-stopped \
        -p 8080:8080 \
        -p 50000:50000 \
        -v jenkins_home:/var/jenkins_home \
        jenkins/jenkins:lts
fi

# -----------------------------
# Versions
# -----------------------------
echo
echo "========================================="
echo "Installed Versions"
echo "========================================="

docker --version
kubectl version --client
kind --version
helm version --short
aws --version
terraform -version

echo
echo "========================================="
echo "Setup Completed Successfully!"
echo "========================================="

echo
echo "If Docker was installed for the first time,"
echo "run the following command or log out and back in:"
echo
echo "    newgrp docker"
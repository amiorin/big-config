terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

variable "do_token" {
  sensitive = true
}
# Configure the DigitalOcean Provider
# Note: You can also set the DIGITALOCEAN_TOKEN environment variable
provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_droplet" "ubuntu_droplet" {
  name     = "ubuntu"
  region   = "ams3"
  size     = "s-1vcpu-1gb-35gb-intel"
  image    = "ubuntu-25-10-x64"
  vpc_uuid = "b6938e67-dc83-11e8-a3da-3cfdfea9f0d8"

  # SSH Keys are passed as a list of IDs or Fingerprints
  ssh_keys = ["812184"]
  # Wait for ssh before starting Ansible
  connection {
    type = "ssh"
    user = "root"
    host = self.ipv4_address
  }
  provisioner "remote-exec" {
    inline = ["ls"]
  }
}

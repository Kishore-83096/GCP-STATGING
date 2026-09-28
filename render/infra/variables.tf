variable "repository_url" {
  description = "HTTPS URL of the GitHub repository connected to Render."
  type        = string
  default     = "https://github.com/Kishore-83096/GCP-STATGING.git"
}

variable "backend_service_name" {
  description = "Name for the Render backend Web Service."
  type        = string
  default     = "zylo-backend"
}

variable "frontend_site_name" {
  description = "Name for the Render frontend Static Site."
  type        = string
  default     = "zylo-frontend"
}

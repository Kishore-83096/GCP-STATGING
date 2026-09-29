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
  description = "Name for the Render Static Site."
  type        = string
  default     = "zylo-frontend"
}

variable "database_url" {
  description = "PostgreSQL connection URL for the backend runtime."
  type        = string
  sensitive   = true
}

variable "jwt_secret_key" {
  description = "Persistent secret used to sign backend JWTs."
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.jwt_secret_key) >= 32
    error_message = "jwt_secret_key must contain at least 32 characters."
  }
}

variable "frontend_url" {
  description = "Public origin of the deployed frontend, used by backend CORS."
  type        = string
}

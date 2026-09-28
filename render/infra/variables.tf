variable "repository_url" {
  description = "HTTPS URL of the GitHub repository connected to Render."
  type        = string
}

variable "backend_service_name" {
  description = "Render Web Service name (also used to form its default Render URL)."
  type        = string
  default     = "zylo-backend"
}

variable "frontend_site_name" {
  description = "Render Static Site name (also used to form its default Render URL)."
  type        = string
  default     = "zylo-frontend"
}

variable "backend_branch" {
  description = "Git branch deployed to the Render backend service."
  type        = string
  default     = "main"
}

variable "frontend_branch" {
  description = "Git branch deployed to the Render frontend static site."
  type        = string
  default     = "main"
}

variable "backend_region" {
  description = "Render region for the backend Web Service."
  type        = string
}
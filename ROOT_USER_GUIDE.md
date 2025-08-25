# 🔐 Root User Execution Guide - Cosmos 2048

## ⚠️ Running Scripts as Root

All Cosmos 2048 scripts now support execution as root user, but with **security warnings**.

### 🛡️ Security Considerations

**Running as root is NOT recommended for production because:**
- Docker containers inherit root privileges
- Increased security risk if containers are compromised  
- Goes against security best practices
- No privilege separation

**However, root execution is allowed for:**
- Quick testing environments
- Isolated development servers
- Emergency situations
- Systems where you're already root

## 🚀 How to Use

### **All scripts will show this warning when run as root:**

```bash
⚠️  Running as ROOT user detected!
   This is not recommended for security reasons.
   Docker containers will run with elevated privileges.
   Consider running as a regular user with sudo access.

Do you want to continue as root? (y/N):
```

### **Scripts that support root execution:**

1. **`./start-production.sh`** - Production deployment
2. **`./start-low-memory.sh`** - Low memory deployment  
3. **`./install-dependencies.sh`** - Dependency installation
4. **`./fix-docker.sh`** - Docker troubleshooting
5. **`./verify-installation.sh`** - Installation verification
6. **`./diagnose-issue.sh`** - Issue diagnosis
7. **`./quick-restart.sh`** - Quick service restart

## 💡 Best Practices

### **Recommended Approach (Non-Root):**
```bash
# Create a regular user with sudo access
adduser cosmos2048
usermod -aG sudo cosmos2048
su - cosmos2048

# Then run scripts normally
./start-production.sh
```

### **Root Execution (When Necessary):**
```bash
# Run as root with confirmation
sudo su -
cd /path/to/cosmos-2048
./start-production.sh
# Answer 'y' to the security warning
```

### **Alternative Approach:**
```bash
# Run specific commands as root when needed
sudo ./start-production.sh
# The script will detect you're using sudo and handle accordingly
```

## 🔄 What Changes When Running as Root

### **With Regular User + Sudo:**
- Scripts use `sudo` prefix for system commands
- User added to docker group
- Better security isolation
- Follows Linux security principles

### **With Root User:**
- Direct system command execution
- No sudo prefix needed
- Docker group management skipped
- Higher security risk
- ⚠️ Warning prompts before execution

## 🎯 Quick Reference

```bash
# Check current user
whoami

# If root, you'll see warnings on script execution
# If regular user, scripts use sudo automatically

# To switch to regular user:
su - username

# To run single command as regular user:
su -c "./start-production.sh" username

# To see effective user ID:
id
```

## 🔧 Troubleshooting Root Issues

### **If Docker fails with root:**
```bash
# Check Docker daemon
systemctl status docker

# Start Docker daemon
systemctl start docker

# Check Docker info
docker info
```

### **If permissions are wrong:**
```bash
# Fix Docker socket permissions
chown root:docker /var/run/docker.sock
chmod 660 /var/run/docker.sock

# Or just reset to root only:
chown root:root /var/run/docker.sock
chmod 666 /var/run/docker.sock
```

### **If containers won't start:**
```bash
# Check available resources
free -h
df -h

# Clean up Docker
docker system prune -a
```

---

## ⚖️ Security vs Convenience

**Choose based on your environment:**

| Environment | Recommended Approach |
|-------------|---------------------|
| 🏢 **Production Server** | Regular user + sudo |
| 🧪 **Development/Testing** | Root OK (with warnings) |  
| 🔒 **Security-Critical** | Never root |
| ⚡ **Quick Demo/PoC** | Root acceptable |
| 🐳 **Container/VM** | Root OK (isolated environment) |

**Remember: The scripts will always warn you about security implications when running as root!** 🛡️
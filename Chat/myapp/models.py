from django.db import models
from django.contrib.auth.models import User
from django.templatetags.static import static


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='avatars/', null=True, blank=True)
    displayname = models.CharField(max_length=20, null=True, blank=True)
    info = models.TextField(null=True, blank=True) 

    def __str__(self):
        return str(self.user)
     
    @property
    def name(self):
        if self.displayname:
            name = self.displayname
        else:
            name = self.user.username
        return name
    
    @property
    def avatar(self):
        try:
            avatar = self.image.url
        except:
            avatar = static('images/avatar.svg')
        return avatar

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Message from {self.sender.username} to {self.recipient.username}'

class Chat(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chats')
    contact = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacts')
    last_message = models.TextField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Chat between {self.user.username} and {self.contact.username}"
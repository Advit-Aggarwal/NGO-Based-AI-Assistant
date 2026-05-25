from django.db import models


class Volunteer(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    skills = models.TextField(blank=True, null=True)
    availability = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return self.name


class Event(models.Model):
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    date = models.CharField(max_length=50)
    capacity = models.IntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return self.title


class DonationCampaign(models.Model):
    ngo_name = models.CharField(max_length=255)
    cause = models.CharField(max_length=255)
    audience = models.CharField(max_length=255, default='general supporters')
    target_amount = models.DecimalField(max_digits=12, decimal_places=2, default=50000)
    deadline = models.CharField(max_length=100, blank=True, null=True)
    tone = models.CharField(max_length=20, default='inspiring')
    generated_content = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return f"{self.ngo_name} — {self.cause}"

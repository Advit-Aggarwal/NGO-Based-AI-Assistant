from django.contrib import admin
from .models import Volunteer, Event, DonationCampaign


@admin.register(Volunteer)
class VolunteerAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'email', 'skills')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'date', 'capacity', 'created_at')
    search_fields = ('title', 'location')


@admin.register(DonationCampaign)
class DonationCampaignAdmin(admin.ModelAdmin):
    list_display = ('ngo_name', 'cause', 'target_amount', 'tone', 'created_at')
    list_filter = ('tone',)
    search_fields = ('ngo_name', 'cause')

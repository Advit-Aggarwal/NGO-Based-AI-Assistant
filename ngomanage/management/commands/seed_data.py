from django.core.management.base import BaseCommand
from ngomanage.models import Volunteer, Event


class Command(BaseCommand):
    help = 'Seed the database with sample NGO data'

    def handle(self, *args, **options):
        if Volunteer.objects.count() == 0:
            volunteers = [
                Volunteer(
                    name='Aarav Sharma',
                    email='aarav@example.com',
                    phone='+91 98765 43210',
                    skills='Community outreach, Teaching',
                    availability='Weekends',
                    status='active',
                ),
                Volunteer(
                    name='Priya Patel',
                    email='priya@example.com',
                    phone='+91 87654 32109',
                    skills='Graphic design, Social media',
                    availability='Evenings',
                    status='active',
                ),
                Volunteer(
                    name='Rahul Verma',
                    email='rahul@example.com',
                    phone='',
                    skills='Event planning, Fundraising',
                    availability='Flexible',
                    status='active',
                ),
                Volunteer(
                    name='Ananya Gupta',
                    email='ananya@example.com',
                    phone='+91 76543 21098',
                    skills='Content writing, Translation',
                    availability='Weekdays',
                    status='inactive',
                ),
            ]
            Volunteer.objects.bulk_create(volunteers)
            self.stdout.write(self.style.SUCCESS(f'Created {len(volunteers)} volunteers'))
        else:
            self.stdout.write('Volunteers already exist, skipping.')

        if Event.objects.count() == 0:
            events = [
                Event(
                    title='Community Clean-Up Drive',
                    location='Central Park, Delhi',
                    date='2026-06-15',
                    capacity=100,
                    description='Join us to make the neighborhood cleaner and greener. Bring gloves and enthusiasm!',
                ),
                Event(
                    title='Blood Donation Camp',
                    location='City Hospital Grounds',
                    date='2026-07-01',
                    capacity=200,
                    description='Save lives — donate blood. Open to all adults above 18 years.',
                ),
                Event(
                    title='Youth Empowerment Workshop',
                    location='Community Hall, Sector 5',
                    date='2026-07-20',
                    capacity=50,
                    description='Interactive workshop on career skills, communication, and leadership for students.',
                ),
            ]
            Event.objects.bulk_create(events)
            self.stdout.write(self.style.SUCCESS(f'Created {len(events)} events'))
        else:
            self.stdout.write('Events already exist, skipping.')

        self.stdout.write(self.style.SUCCESS('Seed data complete!'))

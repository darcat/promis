import uuid
from classes.base_project import BaseProject

class DummyProject(BaseProject):
    '''
    [en]: Uplink to astral knowledge
    [uk]: Лінія зв’язку із астралом
    '''

    # Update check sample
    def check(self):
        for _ in range(5):
            yield str(uuid.uuid4())

    # Data fetch sample
    def fetch(self, data_id):
        print("Swallow brings you %s..." % data_identifier)


# Not exported anywhere because no docstring
class eggs():
    pass

# Not exported anywhere because docstring has no language tags
class spam():
    '''Eggs, bacon, spam and spam with spam'''
    pass

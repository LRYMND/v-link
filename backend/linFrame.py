
class LinFrame:
    kMaxBytes = 8

    def __init__(self):
        self.bytes = []

    def append_byte(self, b):
        self.bytes.append(b)

    def pop_byte(self):
        return self.bytes.pop()

    def get_byte(self, index):
        return self.bytes[index]

    def num_bytes(self):
        return len(self.bytes)

    def reset(self):
        self.bytes = []
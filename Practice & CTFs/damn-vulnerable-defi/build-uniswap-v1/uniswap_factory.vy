# interface for exchange
contract Exchange():
    def setup(token_addr: address): modifying

#event
NewExchange: event({token: indexed(address), exchange: indexed(address)})

exchangeTemplate: public(address)
tokenCount: public(uint256)
token_to_exchange: address[address]
exchange_to_token: address[address]
id_to_token: address[uint256]

@public
def initializeFactory(template: address):
    # make sure the exchange template is empty and not initialized
    assert self.exchangeTemplate == ZERO_ADDRESS

    # make sure the template is created and has an address that references it.
    assert template != ZERO_ADDRESS

    # assign the template addres
    self.exchangeTemplate = template


@public
def createExchange(token: address) -> address:

    # necessary addreses should not be null
    assert token != ZERO_ADDRESS
    assert self.exchangeTemplate != ZERO_ADDRESS

    # make sure the an exchange is not created for the token.
    assert self.token_to_exchange[token] == ZERO_ADDRESS

    # create_with_code_of = new
    exchange: address = create_with_code_of(self.exchangeTemplate)

    # "Exchange" acts like an ABI, so that we can call the "setup" function.
    Exchange(exchange).setup(token)

    # we need to update the different data structures for this token.
    self.token_to_exchange[token] = exchange
    self.exchange_to_token[exchange] = token

    # this is count of "exchange contracts" created for different tokens.
    token_id: uint256 = self.tokenCount + 1
    self.tokenCount = token_id
    self.id_to_token[token_id] = token  # a mapping to get "token contract" from token_id

    # advertise about this new exchange contract for the token.
    log.NewExchange(token, exchange)
    return exchange

# Getter functions
@public
@constant
def getExchange(token: address) -> address:
    return self.token_to_exchange[token]

@public
@constant
def getToken(exchange: address) -> address:
    return self.exchange_to_token[exchange]

@public
@constant
def getTokenWithId(token_id: uint256) -> address:
    return self.id_to_token[token_id]

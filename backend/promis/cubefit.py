#
# Copyright 2016 Space Research Institute of NASU and SSAU (Ukraine)
#
# Licensed under the EUPL, Version 1.1 or – as soon they
# will be approved by the European Commission - subsequent
# versions of the EUPL (the "Licence");
# You may not use this work except in compliance with the
# Licence.
# You may obtain a copy of the Licence at:
#
# https://joinup.ec.europa.eu/software/page/eupl
#
# Unless required by applicable law or agreed to in
# writing, software distributed under the Licence is
# distributed on an "AS IS" basis,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
# express or implied.
# See the Licence for the specific language governing
# permissions and limitations under the Licence.
#

# Matrix representation:
# - Input data in a big list
# - list of lists which represent columns, elements are indices in the original big list
# TODO: any more standard way?

# Determinant of a 4x4 matrix
def det4(m, idx):
    """
    Determinant of a 4x4 matrix.

    m   -- list of values.
    idx -- list of lists indices to form matrix from, arranged by column.
    """
    def mat(a,b,idx):
        return m[idx[b][a]]
    def A(a,b):
        return mat(a,b,idx)

    def det3(m, idx):
        """
        Determinant of a 4x4 matrix.

        m   -- list of values.
        idx -- list of lists indices to form matrix from, arranged by column.
        """
        def A(a,b):
            return mat(a,b,idx)
        return ( A(0,0)*( A(1,1)*A(2,2) - A(1,2)*A(2,1) ) -
                 A(0,1)*( A(1,0)*A(2,2) - A(1,2)*A(2,0) ) + A(0,2)*( A(1,0)*A(2,1) - A(1,1)*A(2,0) ) )

    def minor(j, i, idx):
        """An index matrix corresponding to an i-th, j-th minor of index 4x4 matrix idx"""
        result = idx[:i] + idx[i+1:]
        for k, col in enumerate(result):
            result[k] = col[:j] + col[j+1:]
        return result

    result = 0
    sign = -1
    for i in range(4):
        sign *= -1
        result += sign * A(0, i) * det3(m, minor(0, i, idx))
    return result

def cubic_fit(x, y):
    """
    Deduce coefs of and construct a cubic function of the form ax^3 + bx^2 + cx + d = y(x)

    x, y -- list of input points
    
    >>> cubic_fit([0, 1, 2, 3], [45, 67, 85, 12]) (0.5)             
    51.0625
    """
    def extdet(i):
        newidx = idx[:i] + [ [ 16 + i for i in range(4) ] ] + idx[i+1:]
        return det4(m, newidx)

    # Just works™
    m = [ x[j % 4]**((15-j)//4) for j in range(16) ]
    idx =  [ [ i+4*j for i in range(4)] for j in range(4) ]
    m += [ y[j] for j in range(4)]
    D = det4(m, idx)
    if D==0:
        raise ValueError("Can not solve the equation")
    k = [ extdet(i)/D for i in range(4) ]
    return lambda x: sum(k[i]*(x**(3-i)) for i in range(4))
